import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidate: () => Promise<boolean>;
  isValid: boolean;
  placeholder?: string;
}

export function ApiKeyInput({
  label,
  value,
  onChange,
  onValidate,
  isValid,
  placeholder,
}: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);
  const [validating, setValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const valid = await onValidate();
      setHasValidated(true);
      void valid; // result stored by parent via onValidate
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setHasValidated(false);
            }}
            placeholder={placeholder}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleValidate}
          disabled={!value.trim() || validating}
        >
          {validating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Validate"
          )}
        </Button>
        {hasValidated && !validating && (
          isValid ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-red-500" />
          )
        )}
      </div>
    </div>
  );
}
