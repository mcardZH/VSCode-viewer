import React, { useEffect, useRef } from 'react';
import * as molstar from 'molstar';
import { Viewer } from 'molstar/lib/apps/viewer/app';
import { PluginState } from 'molstar/lib/mol-plugin/state';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';

export interface MolstarViewerProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  // Viewer configuration options
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
  onViewerReady?: (viewer: Viewer) => void;
  onError?: (error: Error) => void;
}

export const MolstarViewer: React.FC<MolstarViewerProps> = ({
  id = 'molstar-viewer',
  className,
  style,
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
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initViewer = async () => {
      try {
        // Set debug mode if enabled
        if (debugMode) {
          molstar.setDebugMode(debugMode, debugMode);
        }

        // Determine volume streaming server
        const defaultVolumeStreamingServer = volumeStreamingServer || 
          ((pdbProvider || 'pdbe') === 'rcsb' 
            ? 'https://maps.rcsb.org'
            : 'https://www.ebi.ac.uk/pdbe/densities');

        // Create viewer with configuration
        const viewer = await molstar.Viewer.create(id, {
          layoutShowControls,
          viewportShowExpand,
          collapseLeftPanel,
          pdbProvider: pdbProvider as 'pdbe' | 'rcsb' | 'pdbj' | undefined,
          emdbProvider: emdbProvider as any,
          volumeStreamingServer: defaultVolumeStreamingServer,
          pixelScale,
          pickScale,
          pickPadding: isNaN(pickPadding) ? 1 : pickPadding,
          enableWboit: enableWboit ? true : undefined,
          preferWebgl1,
        });

        viewerRef.current = viewer as unknown as Viewer;

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

        // Notify that viewer is ready
        if (onViewerReady) {
          onViewerReady(viewer as unknown as Viewer);
        }

      } catch (error) {
        console.error('Error initializing Molstar viewer:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    };

    initViewer();

    // Cleanup function
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose?.();
        } catch (error) {
          console.warn('Error disposing viewer:', error);
        }
        viewerRef.current = null;
      }
    };
  }, [
    id, layoutShowControls, viewportShowExpand, collapseLeftPanel,
    pdbProvider, emdbProvider, volumeStreamingServer, pixelScale,
    pickScale, pickPadding, enableWboit, preferWebgl1, debugMode,
    snapshotId, snapshotUrl, snapshotUrlType, structureUrl,
    structureUrlFormat, structureUrlIsBinary, pdb, pdbDev,
    emdb, modelArchive, loadCommand
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