import useStore from './useStore'

// Gate new features behind a flag. Flags come from the session: { featureFlags: { exportCsv: true } }
export const useFeatureFlag = (flag: string) =>
  useStore((state) => state.user?.featureFlags[flag] ?? false)
