import { Tooltip } from "@chakra-ui/react";

const TooltipElement = (props) => {
  return <Tooltip label="Hello World">{props.children}</Tooltip>;
};

export { TooltipElement };
