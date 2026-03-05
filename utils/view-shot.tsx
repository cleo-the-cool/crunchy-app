import React, { forwardRef } from "react";
import { Platform, View } from "react-native";

const ViewShot = Platform.OS === "web"
  ? forwardRef(({ children, ...props }: any, ref: any) => (
      <View ref={ref} {...props}>{children}</View>
    ))
  : require("react-native-view-shot").default;

export default ViewShot;
