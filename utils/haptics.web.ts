// Web no-ops for haptics
export const impactAsync = async (_style?: any) => {};
export const notificationAsync = async (_type?: any) => {};
export const selectionAsync = async () => {};

export const ImpactFeedbackStyle = {
  Light: "Light" as any,
  Medium: "Medium" as any,
  Heavy: "Heavy" as any,
};

export const NotificationFeedbackType = {
  Success: "Success" as any,
  Warning: "Warning" as any,
  Error: "Error" as any,
};
