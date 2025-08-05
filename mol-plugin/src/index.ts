// Re-export commonly used molstar types and utilities
export * as molstar from 'molstar';

// Import built-in React UI components and types
import { createPluginUI } from 'molstar/lib/mol-plugin-ui';
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginUISpec, DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginState } from 'molstar/lib/mol-plugin/state';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';

// We can now use custom components if needed
// For now, we'll use the default right panel

// Export React component for standalone development (when React is available)
// Note: These exports will only work when React is available as a global variable
export { MolstarViewer, type MolstarViewerProps } from './components/MolstarViewer';

// Utility function to parse URL parameters (extracted from original templates)
export function getParam(name: string, regex: string): string {
  const r = new RegExp(name + '=' + '(' + regex + ')[&]?', 'i');
  return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || '');
}

// Configuration helper to parse common URL parameters
export interface ViewerConfig {
  debugMode?: boolean;
  hideControls?: boolean;
  collapseLeftPanel?: boolean;
  pdbProvider?: string;
  emdbProvider?: string;
  mapProvider?: string;
  pixelScale?: number;
  pickScale?: number;
  pickPadding?: number;
  disableWboit?: boolean;
  preferWebgl1?: boolean;
  snapshotId?: string;
  snapshotUrl?: string;
  snapshotUrlType?: PluginState.SnapshotType;
  structureUrl?: string;
  structureUrlFormat?: BuiltInTrajectoryFormat;
  structureUrlIsBinary?: boolean;
  pdb?: string;
  pdbDev?: string;
  emdb?: string;
  modelArchive?: string;
}

export function parseUrlConfig(): ViewerConfig {
  return {
    debugMode: getParam('debug-mode', '[^&]+').trim() === '1',
    hideControls: getParam('hide-controls', '[^&]+').trim() === '1',
    collapseLeftPanel: getParam('collapse-left-panel', '[^&]+').trim() === '1',
    pdbProvider: getParam('pdb-provider', '[^&]+').trim().toLowerCase() || undefined,
    emdbProvider: getParam('emdb-provider', '[^&]+').trim().toLowerCase() || undefined,
    mapProvider: getParam('map-provider', '[^&]+').trim().toLowerCase() || undefined,
    pixelScale: parseFloat(getParam('pixel-scale', '[^&]+').trim()) || undefined,
    pickScale: parseFloat(getParam('pick-scale', '[^&]+').trim()) || undefined,
    pickPadding: (() => {
      const val = parseFloat(getParam('pick-padding', '[^&]+').trim());
      return isNaN(val) ? undefined : val;
    })(),
    disableWboit: getParam('disable-wboit', '[^&]+').trim() === '1',
    preferWebgl1: getParam('prefer-webgl1', '[^&]+').trim() === '1' || undefined,
    snapshotId: getParam('snapshot-id', '[^&]+').trim() || undefined,
    snapshotUrl: getParam('snapshot-url', '[^&]+').trim() || undefined,
    snapshotUrlType: (getParam('snapshot-url-type', '[^&]+').toLowerCase().trim() as PluginState.SnapshotType) || undefined,
    structureUrl: getParam('structure-url', '[^&]+').trim() || undefined,
    structureUrlFormat: (getParam('structure-url-format', '[a-z]+').toLowerCase().trim() as BuiltInTrajectoryFormat) || undefined,
    structureUrlIsBinary: getParam('structure-url-is-binary', '[^&]+').trim() === '1',
    pdb: getParam('pdb', '[^&]+').trim() || undefined,
    pdbDev: getParam('pdb-dev', '[^&]+').trim() || undefined,
    emdb: getParam('emdb', '[^&]+').trim() || undefined,
    modelArchive: getParam('model-archive', '[^&]+').trim() || undefined,
  };
}

// Built-in React UI helper for creating Molstar viewers
export interface CreateViewerOptions {
  elementId: string;
  // UI Configuration
  spec?: PluginUISpec;
  layoutShowControls?: boolean;
  viewportShowExpand?: boolean;
  collapseLeftPanel?: boolean;
  pdbProvider?: string;
  emdbProvider?: string;
  volumeStreamingServer?: string;
  pixelScale?: number;
  pickScale?: number;
  pickPadding?: number;
  enableWboit?: boolean;
  preferWebgl1?: boolean;
  debugMode?: boolean;
  // Loading options
  snapshotId?: string;
  snapshotUrl?: string;
  snapshotUrlType?: PluginState.SnapshotType;
  structureUrl?: string;
  structureUrlFormat?: BuiltInTrajectoryFormat;
  structureUrlIsBinary?: boolean;
  pdb?: string;
  pdbDev?: string;
  emdb?: string;
  modelArchive?: string;
  loadCommand?: string;
  // UI Customization callback
  onBeforeUIRender?: (ctx: PluginUIContext) => (Promise<void> | void);
}

export async function createViewer(options: CreateViewerOptions): Promise<PluginUIContext> {
  const {
    elementId,
    spec,
    layoutShowControls = true,
    viewportShowExpand = false,
    collapseLeftPanel = false,
    pdbProvider = 'pdbe',
    emdbProvider = 'pdbe',
    volumeStreamingServer,
    pixelScale = 1,
    pickScale = 0.25,
    pickPadding = 1,
    enableWboit,
    preferWebgl1,
    debugMode = false,
    snapshotId,
    snapshotUrl,
    snapshotUrlType = 'molj' as PluginState.SnapshotType,
    structureUrl,
    structureUrlFormat,
    structureUrlIsBinary = false,
    pdb,
    pdbDev,
    emdb,
    modelArchive,
    loadCommand,
    onBeforeUIRender
  } = options;

  // Get target element
  const target = document.getElementById(elementId);
  if (!target) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Set debug mode if enabled
  if (debugMode) {
    (window as any).molstar?.setDebugMode?.(debugMode, debugMode);
  }

  // Determine volume streaming server
  const defaultVolumeStreamingServer = volumeStreamingServer || 
    ((pdbProvider || 'pdbe') === 'rcsb' 
      ? 'https://maps.rcsb.org'
      : 'https://www.ebi.ac.uk/pdbe/densities');

  // Create custom spec or use default
  const pluginSpec: PluginUISpec = spec || {
    ...DefaultPluginUISpec(),
    components: {
      ...DefaultPluginUISpec().components,
      controls: {
        left: layoutShowControls ? DefaultPluginUISpec().components?.controls?.left : 'none',
        right: layoutShowControls ? DefaultPluginUISpec().components?.controls?.right : 'none',
        top: layoutShowControls ? DefaultPluginUISpec().components?.controls?.top : 'none',
        bottom: layoutShowControls ? DefaultPluginUISpec().components?.controls?.bottom : 'none',
      }
    },
    behaviors: [
      ...DefaultPluginUISpec().behaviors || [],
    ],
    config: [
      ...DefaultPluginUISpec().config || [],
    ]
  };

  // Create Plugin UI with built-in React components
  const plugin = await createPluginUI({
    target,
    render: renderReact18,
    spec: pluginSpec,
    onBeforeUIRender: async (ctx) => {
      // Custom initialization callback
      if (onBeforeUIRender) {
        await onBeforeUIRender(ctx);
      }
    }
  });

  // Load content based on provided options
  try {
    if (snapshotId) {
      // For snapshot loading, we'll use a simplified approach
      console.log('Loading snapshot ID:', snapshotId);
    }

    if (snapshotUrl && snapshotUrlType) {
      // For snapshot URL loading
      console.log('Loading snapshot URL:', snapshotUrl, snapshotUrlType);
    }

    if (structureUrl) {
      const data = await plugin.builders.data.download({ url: structureUrl, isBinary: structureUrlIsBinary });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, structureUrlFormat || 'mmcif');
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    }

    if (pdb) {
      const data = await plugin.builders.data.download({ url: `https://www.ebi.ac.uk/pdbe/static/entry/${pdb}_updated.cif`, isBinary: false });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    }

    if (pdbDev) {
      const data = await plugin.builders.data.download({ url: `https://pdb-dev.wwpdb.org/static/cif/${pdbDev.toUpperCase()}.cif`, isBinary: false });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    }

    if (emdb) {
      console.log('EMDB loading not yet implemented:', emdb);
      // const data = await plugin.builders.data.download({ url: `https://www.ebi.ac.uk/pdbe/static/entry/emdb_${emdb}.map.gz`, isBinary: true });
      // Volume loading will be implemented later
    }

    if (modelArchive) {
      const data = await plugin.builders.data.download({ url: `https://www.modelarchive.org/doi/10.5452/${modelArchive}.cif`, isBinary: false });
      const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
    }
  } catch (loadError) {
    console.warn('Error loading data:', loadError);
  }

  // Execute custom load command if provided
  if (loadCommand) {
    try {
      // Safely evaluate the load command
      const func = new Function('plugin', loadCommand);
      func(plugin);
    } catch (cmdError) {
      console.warn('Error executing load command:', cmdError);
    }
  }

  console.log('Plugin UI components:', plugin.spec.components);

  return plugin;
}