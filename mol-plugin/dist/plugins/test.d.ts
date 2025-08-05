import * as React from 'react';
import { PluginUIComponent } from 'molstar/lib/mol-plugin-ui/base';
declare class CustomRightPanel extends PluginUIComponent {
    render(): React.DetailedReactHTMLElement<{
        style: {
            padding: string;
            backgroundColor: "#f0f0f0";
        };
    }, HTMLElement>;
}
export default CustomRightPanel;
