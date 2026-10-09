// Demo-only controls: switch user (to see permissions change), slow network, simulated server errors.
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { Client } from 'app/clients/Client'
import { DEMO_USERS, getDevSettings, updateDevSettings } from 'app/utils/devSettings'
import { loadSession } from 'app/zustand/useAppSetup'
import useStore from 'app/zustand/useStore'
import { useState } from 'react'

export default function DevToolbar() {
  const [settings, setSettings] = useState(getDevSettings)
  const workspaceName = useStore((state) => state.workspace?.name)
  const role = useStore((state) => state.user?.role)

  const update = (patch: Parameters<typeof updateDevSettings>[0]) =>
    setSettings(updateDevSettings(patch))

  const changeUser = async (userId: string) => {
    update({ userId })
    Client.bindToUser(userId)
    await loadSession({ silent: true })
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        px: 3,
        py: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography component="div" variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {workspaceName}
        {role && <Chip size="small" label={role} sx={{ ml: 1 }} />}
      </Typography>
      <Select
        size="small"
        value={settings.userId}
        onChange={(event) => void changeUser(event.target.value)}
        inputProps={{ 'aria-label': 'Demo user' }}
      >
        {DEMO_USERS.map(({ id, label }) => (
          <MenuItem key={id} value={id}>
            {label}
          </MenuItem>
        ))}
      </Select>
      <FormControlLabel
        label="Slow network"
        control={
          <Switch
            size="small"
            checked={settings.slowNetwork}
            onChange={(_, slowNetwork) => update({ slowNetwork })}
          />
        }
      />
      <FormControlLabel
        label="Simulate errors"
        control={
          <Switch
            size="small"
            checked={settings.simulateErrors}
            onChange={(_, simulateErrors) => update({ simulateErrors })}
          />
        }
      />
    </Stack>
  )
}
