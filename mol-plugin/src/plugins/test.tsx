import * as React from 'react';
import { PluginUIComponent } from 'molstar/lib/mol-plugin-ui/base';

class CustomRightPanel extends PluginUIComponent {
  render() {
    return React.createElement('div', { 
      style: { padding: '10px', backgroundColor: '#f0f0f0' } 
    }, 'Custom Right Panel');
  }
}

export default CustomRightPanel;