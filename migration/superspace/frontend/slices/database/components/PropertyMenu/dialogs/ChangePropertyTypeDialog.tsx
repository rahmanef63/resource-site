import { useState, useMemo } from "react";
import { ResponsiveDialog } from "@/frontend/shared/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DATABASE_FIELD_DEFINITIONS } from "@/frontend/slices/database/config/fields";
import type { DatabaseFieldType } from "@/frontend/slices/database/types";
import { 
  getTransformationDescription, 
  isLossyConversion 
} from "@/frontend/slices/database/lib/dataTransformer";
import { AlertTriangle, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangePropertyTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyName: string;
  currentType: DatabaseFieldType;
  onConfirm: (newType: DatabaseFieldType) => void;
}

export function ChangePropertyTypeDialog({
  open,
  onOpenChange,
  propertyName,
  currentType,
  onConfirm,
}: ChangePropertyTypeDialogProps) {
  const [selectedType, setSelectedType] = useState<DatabaseFieldType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedType(null);
      setSearchQuery("");
    }
    onOpenChange(open);
  };

  // Filter property types by search query
  const filteredTypes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return Object.entries(DATABASE_FIELD_DEFINITIONS);

    return Object.entries(DATABASE_FIELD_DEFINITIONS).filter(([type, def]) => {
      return (
        type.toLowerCase().includes(query) ||
        def.label.toLowerCase().includes(query) ||
        def.description?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  // Get transformation details
  const transformationInfo = useMemo(() => {
    if (!selectedType) return null;

    return {
      isLossy: isLossyConversion(currentType, selectedType),
      description: getTransformationDescription(currentType, selectedType),
    };
  }, [currentType, selectedType]);

  const handleConfirm = () => {
    if (selectedType) {
      onConfirm(selectedType);
      handleOpenChange(false);
    }
  };

  const handleTypeSelect = (type: DatabaseFieldType) => {
    setSelectedType(type);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange} variant="modal" size="lg">
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Change property type</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>
          Change the type of <span className="font-medium">&quot;{propertyName}&quot;</span> from{" "}
          <span className="font-medium">{DATABASE_FIELD_DEFINITIONS[currentType]?.label}</span> to:
        </ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-4 py-4 sm:px-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search property types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Property Types Grid */}
          <ScrollArea className="h-[300px] border rounded-md">
            <div className="grid grid-cols-2 gap-2 p-4">
              {filteredTypes.map(([type, definition]) => {
                const TypeIcon = definition.icon;
                const isSelected = selectedType === type;
                const isCurrent = currentType === type;

                return (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type as DatabaseFieldType)}
                    disabled={isCurrent}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
                      "hover:bg-accent hover:border-accent-foreground/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected && "border-primary bg-primary/5",
                      isCurrent && "bg-muted border-muted-foreground/20"
                    )}
                  >
                    <div className="mt-0.5">
                      <TypeIcon className={cn(
                        "h-5 w-5",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium text-sm",
                          isSelected && "text-primary"
                        )}>
                          {definition.label}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-muted-foreground">(current)</span>
                        )}
                        {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
                      </div>
                      {definition.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {definition.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Transformation Info */}
          {transformationInfo && (
            <div className="space-y-2">
              {transformationInfo.isLossy && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">Warning:</span> This conversion may result in data loss.
                  </AlertDescription>
                </Alert>
              )}
              
              <Alert>
                <AlertDescription className="text-sm">
                  <span className="font-medium">Transformation:</span>{" "}
                  {transformationInfo.description}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </ResponsiveDialog.Body>

      <ResponsiveDialog.Footer className="flex-col-reverse sm:flex-row">
        <Button
          variant="outline"
          onClick={() => handleOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedType || selectedType === currentType}
        >
          Change Type
        </Button>
      </ResponsiveDialog.Footer>
    </ResponsiveDialog>
  );
}
