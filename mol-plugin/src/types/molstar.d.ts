declare module 'molstar' {
  export namespace Viewer {
    interface ViewerOptions {
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
    }

    interface ViewerInstance {
      setRemoteSnapshot(snapshotId: string): Promise<void>;
      loadSnapshotFromUrl(url: string, type: string): Promise<void>;
      loadStructureFromUrl(url: string, format?: string, isBinary?: boolean): Promise<void>;
      loadPdb(pdbId: string): Promise<void>;
      loadPdbDev(pdbId: string): Promise<void>;
      loadEmdb(emdbId: string): Promise<void>;
      loadAlphaFoldDb(accession: string): Promise<void>;
      loadModelArchive(modelArchive: string): Promise<void>;
      dispose?(): void;
    }

    function create(elementId: string, options: ViewerOptions): Promise<ViewerInstance>;
  }

  export function setDebugMode(debug: boolean, verbose: boolean): void;
}

declare global {
  namespace molstar {
    export = import('molstar');
  }
}