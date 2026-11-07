import { SwitchProps } from "@/constants/enums";
import { Host, Toggle, ToggleProps } from "@expo/ui/swift-ui";

export default function ToggleComponent(props: SwitchProps) {
  return (
    <Host matchContents>
      <Toggle isOn={props.value} onIsOnChange={props.onCheckedChange} />
    </Host>
  );
}
