import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Download, ExternalLink, Copy } from 'lucide-react';
import { useAssets, useRemoveAsset } from '@/frontend/shared/foundation/hooks/assets';
import { ConvexLoadingState } from '../loading/ConvexLoadingState';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceContext } from '@/frontend/shared/foundation/provider/WorkspaceProvider';

interface AssetGalleryProps {
  onSelectAsset?: (assetId: string, url: string) => void;
  limit?: number;
}

export function AssetGallery({ onSelectAsset, limit }: AssetGalleryProps) {
  const { workspaceId: ctxWorkspaceId } = useWorkspaceContext();
  const workspaceId = ctxWorkspaceId || null;
  
  const { assets, loading } = useAssets(workspaceId, limit);
  const { mutate: removeAsset } = useRemoveAsset();
  const { toast } = useToast();

  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (assetId: string) => {
    if (!workspaceId) return;

    setDeleting(true);
    try {
      await removeAsset({ id: assetId as any, workspaceId });
      toast({
        title: 'Asset deleted',
        description: 'The asset has been removed successfully.'
      });
      setSelectedAsset(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete asset',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied',
      description: 'Asset URL copied to clipboard'
    });
  };

  if (loading) {
    return <ConvexLoadingState variant="skeleton" skeletonCount={6} />;
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No assets uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets.map((asset: any) => {
          const isImage = asset.mimeType.startsWith('image/');
          
          return (
            <Card
              key={asset._id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedAsset(asset)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <Image
                      src={asset.url}
                      alt={asset.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="text-4xl text-muted-foreground">
                      {asset.mimeType.includes('pdf') ? '📄' : '📁'}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-3">
                <div className="w-full">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(asset.fileSize / 1024).toFixed(0)} KB
                  </p>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {selectedAsset && (
        <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAsset.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAsset.mimeType.startsWith('image/') && (
                <div className="rounded-lg overflow-hidden border">
                  <Image
                    src={selectedAsset.url}
                    alt={selectedAsset.name}
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">File Size</p>
                  <p className="font-medium">
                    {(selectedAsset.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="secondary">{selectedAsset.mimeType}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">
                    {new Date(selectedAsset.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUrl(selectedAsset.url)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedAsset.url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = selectedAsset.url;
                    a.download = selectedAsset.name;
                    a.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <div className="flex-1" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedAsset._id)}
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>

              {onSelectAsset && (
                <Button
                  className="w-full"
                  onClick={() => {
                    onSelectAsset(selectedAsset._id, selectedAsset.url);
                    setSelectedAsset(null);
                  }}
                >
                  Select Asset
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
