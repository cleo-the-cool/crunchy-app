import React, { forwardRef } from "react";
import { View } from "react-native";

const ViewShot = forwardRef(({ children, ...props }: any, ref: any) => (
  <View ref={ref} {...props}>{children}</View>
));

ViewShot.displayName = "ViewShot";
export default ViewShot;
