// Re-export commonly used molstar types and utilities
export * as molstar from 'molstar';

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
  snapshotUrlType?: string;
  structureUrl?: string;
  structureUrlFormat?: string;
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
    snapshotUrlType: getParam('snapshot-url-type', '[^&]+').toLowerCase().trim() || undefined,
    structureUrl: getParam('structure-url', '[^&]+').trim() || undefined,
    structureUrlFormat: getParam('structure-url-format', '[a-z]+').toLowerCase().trim() || undefined,
    structureUrlIsBinary: getParam('structure-url-is-binary', '[^&]+').trim() === '1',
    pdb: getParam('pdb', '[^&]+').trim() || undefined,
    pdbDev: getParam('pdb-dev', '[^&]+').trim() || undefined,
    emdb: getParam('emdb', '[^&]+').trim() || undefined,
    modelArchive: getParam('model-archive', '[^&]+').trim() || undefined,
  };
}

// Pure JavaScript helper for creating Molstar viewers (webview compatible)
export interface CreateViewerOptions {
  elementId: string;
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
  snapshotUrlType?: string;
  structureUrl?: string;
  structureUrlFormat?: string;
  structureUrlIsBinary?: boolean;
  pdb?: string;
  pdbDev?: string;
  emdb?: string;
  modelArchive?: string;
  loadCommand?: string;
}

export async function createViewer(options: CreateViewerOptions): Promise<any> {
  const {
    elementId,
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
    snapshotUrlType = 'molj',
    structureUrl,
    structureUrlFormat,
    structureUrlIsBinary = false,
    pdb,
    pdbDev,
    emdb,
    modelArchive,
    loadCommand
  } = options;

  // Set debug mode if enabled
  if (debugMode) {
    (window as any).molstar.setDebugMode(debugMode, debugMode);
  }

  // Determine volume streaming server
  const defaultVolumeStreamingServer = volumeStreamingServer || 
    ((pdbProvider || 'pdbe') === 'rcsb' 
      ? 'https://maps.rcsb.org'
      : 'https://www.ebi.ac.uk/pdbe/densities');

  // Create viewer with configuration
  const viewer = await (window as any).molstar.Viewer.create(elementId, {
    layoutShowControls,
    viewportShowExpand,
    collapseLeftPanel,
    pdbProvider,
    emdbProvider,
    volumeStreamingServer: defaultVolumeStreamingServer,
    pixelScale,
    pickScale,
    pickPadding: isNaN(pickPadding) ? 1 : pickPadding,
    enableWboit: enableWboit ? true : undefined,
    preferWebgl1,
  });

  // Load content based on provided options
  if (snapshotId) {
    await viewer.setRemoteSnapshot(snapshotId);
  }

  if (snapshotUrl && snapshotUrlType) {
    await viewer.loadSnapshotFromUrl(snapshotUrl, snapshotUrlType);
  }

  if (structureUrl) {
    await viewer.loadStructureFromUrl(structureUrl, structureUrlFormat, structureUrlIsBinary);
  }

  if (pdb) {
    await viewer.loadPdb(pdb);
  }

  if (pdbDev) {
    await viewer.loadPdbDev(pdbDev);
  }

  if (emdb) {
    await viewer.loadEmdb(emdb);
  }

  if (modelArchive) {
    await viewer.loadModelArchive(modelArchive);
  }

  // Execute custom load command if provided
  if (loadCommand) {
    try {
      // Safely evaluate the load command
      const func = new Function('viewer', loadCommand);
      func(viewer);
    } catch (cmdError) {
      console.warn('Error executing load command:', cmdError);
    }
  }

  return viewer;
}