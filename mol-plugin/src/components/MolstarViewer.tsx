import React, { useEffect, useRef } from 'react';
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { PluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginState } from 'molstar/lib/mol-plugin/state';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import { createViewer } from '../index';

export interface MolstarViewerProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
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
  // Callbacks
  onViewerReady?: (plugin: PluginUIContext) => void;
  onError?: (error: Error) => void;
  onBeforeUIRender?: (ctx: PluginUIContext) => (Promise<void> | void);
}

export const MolstarViewer: React.FC<MolstarViewerProps> = ({
  id = 'molstar-viewer',
  className,
  style,
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
  snapshotUrlType = 'molj',
  structureUrl,
  structureUrlFormat,
  structureUrlIsBinary = false,
  pdb,
  pdbDev,
  emdb,
  modelArchive,
  loadCommand,
  onViewerReady,
  onError,
  onBeforeUIRender
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pluginRef = useRef<PluginUIContext | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initViewer = async () => {
      try {
        // Create plugin using built-in React UI
        const plugin = await createViewer({
          elementId: id,
          spec,
          layoutShowControls,
          viewportShowExpand,
          collapseLeftPanel,
          pdbProvider,
          emdbProvider,
          volumeStreamingServer,
          pixelScale,
          pickScale,
          pickPadding,
          enableWboit,
          preferWebgl1,
          debugMode,
          snapshotId,
          snapshotUrl,
          snapshotUrlType,
          structureUrl,
          structureUrlFormat,
          structureUrlIsBinary,
          pdb,
          pdbDev,
          emdb,
          modelArchive,
          loadCommand,
          onBeforeUIRender
        });

        pluginRef.current = plugin;

        // Notify that plugin is ready
        if (onViewerReady) {
          onViewerReady(plugin);
        }

      } catch (error) {
        console.error('Error initializing Molstar plugin:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    initViewer();

    // Cleanup function
    return () => {
      if (pluginRef.current) {
        try {
          pluginRef.current.dispose?.();
        } catch (error) {
          console.warn('Error disposing plugin:', error);
        }
        pluginRef.current = null;
      }
    };
  }, [
    id, spec, layoutShowControls, viewportShowExpand, collapseLeftPanel,
    pdbProvider, emdbProvider, volumeStreamingServer, pixelScale,
    pickScale, pickPadding, enableWboit, preferWebgl1, debugMode,
    snapshotId, snapshotUrl, snapshotUrlType, structureUrl,
    structureUrlFormat, structureUrlIsBinary, pdb, pdbDev,
    emdb, modelArchive, loadCommand, onBeforeUIRender
  ]);

  const defaultStyle: React.CSSProperties = {
    position: 'absolute',
    left: '100px',
    top: '100px',
    width: '800px',
    height: '600px',
    ...style
  };

  // Check if we're in a real React environment
  if (typeof window !== 'undefined' && !(window as any).React) {
    console.warn('MolstarViewer: React component used in non-React environment. Use MolstarPlugin.createViewer() instead.');
    return null;
  }

  return (
    <div
      id={id}
      ref={containerRef}
      className={className}
      style={defaultStyle}
    />
  );
};

export default MolstarViewer;