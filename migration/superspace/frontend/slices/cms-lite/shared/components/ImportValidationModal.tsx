import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Check, X, AlertCircle } from "lucide-react";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationItem {
  data: any;
  isValid: boolean;
  errors: ValidationError[];
  index: number;
}

interface ImportValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: any[]) => void;
  items: any[];
  entityType: string;
  validateItem?: (item: any) => { isValid: boolean; errors: ValidationError[] };
}

export default function ImportValidationModal({
  isOpen,
  onClose,
  onConfirm,
  items,
  entityType,
  validateItem,
}: ImportValidationModalProps) {
  const [validatedItems, setValidatedItems] = useState<ValidationItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [parseError, setParseError] = useState<string>("");

  useEffect(() => {
    if (!items || !Array.isArray(items)) {
      setParseError("Invalid JSON: Data must be an array");
      setValidatedItems([]);
      return;
    }

    if (items.length === 0) {
      setParseError("No items found in the JSON data");
      setValidatedItems([]);
      return;
    }

    setParseError("");
    
    const validated = items.map((item, index) => {
      const validation = validateItem
        ? validateItem(item)
        : { isValid: true, errors: [] };
      
      return {
        data: item,
        isValid: validation.isValid,
        errors: validation.errors,
        index,
      };
    });

    setValidatedItems(validated);
    
    const validIndices = validated
      .filter((item) => item.isValid)
      .map((item) => item.index);
    setSelectedIndices(new Set(validIndices));
  }, [items, validateItem]);

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const selectAll = () => {
    setSelectedIndices(new Set(validatedItems.map((item) => item.index)));
  };

  const deselectAll = () => {
    setSelectedIndices(new Set());
  };

  const selectOnlyValid = () => {
    const validIndices = validatedItems
      .filter((item) => item.isValid)
      .map((item) => item.index);
    setSelectedIndices(new Set(validIndices));
  };

  const handleConfirm = () => {
    const selectedItems = validatedItems
      .filter((item) => selectedIndices.has(item.index))
      .map((item) => item.data);
    
    onConfirm(selectedItems);
  };

  const validCount = validatedItems.filter((item) => item.isValid).length;
  const invalidCount = validatedItems.length - validCount;
  const selectedCount = selectedIndices.size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import ${entityType} - Validation`}
      size="xl"
    >
      <div className="flex flex-col gap-4 max-h-[70vh]">
        {parseError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  JSON Parse Error
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {parseError}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-foreground">
                    Total: <strong>{validatedItems.length}</strong>
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    Valid: <strong>{validCount}</strong>
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      Invalid: <strong>{invalidCount}</strong>
                    </span>
                  )}
                  <span className="text-blue-600 dark:text-blue-400">
                    Selected: <strong>{selectedCount}</strong>
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={selectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={selectOnlyValid}
                  >
                    Select Valid
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={deselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-auto flex-1 border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-left w-12"></th>
                    <th className="p-3 text-left w-16">#</th>
                    <th className="p-3 text-left w-20">Status</th>
                    <th className="p-3 text-left">Preview</th>
                    <th className="p-3 text-left">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedItems.map((item) => (
                    <tr
                      key={item.index}
                      className={`border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        selectedIndices.has(item.index)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIndices.has(item.index)}
                          onChange={() => toggleSelection(item.index)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {item.index + 1}
                      </td>
                      <td className="p-3">
                        {item.isValid ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Check className="w-4 h-4" />
                            Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <X className="w-4 h-4" />
                            Invalid
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-xs text-slate-700 dark:text-slate-300 max-w-md truncate">
                          {JSON.stringify(item.data).substring(0, 100)}
                          {JSON.stringify(item.data).length > 100 && "..."}
                        </div>
                      </td>
                      <td className="p-3">
                        {item.errors.length > 0 && (
                          <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                            {item.errors.map((error, idx) => (
                              <li key={idx}>
                                <strong>{error.field}:</strong> {error.message}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={parseError !== "" || selectedCount === 0}
          >
            Import {selectedCount} {entityType}
            {selectedCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
