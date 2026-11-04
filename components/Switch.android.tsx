import { SwitchProps } from "@/constants/enums";
import { Host, Switch } from "@expo/ui/jetpack-compose";

export default function SwitchComponent(props: SwitchProps) {
  return (
    <Host matchContents>
      <Switch {...props} />
    </Host>
  );
}
