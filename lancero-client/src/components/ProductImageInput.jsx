import { useEffect, useMemo, useRef } from 'react';
import { validateImageFile } from '../utils/imageRules';

const ProductImageInput = ({ file, currentImage, error, onSelect, onError, onClear, onRemoveCurrent }) => {
  const inputRef = useRef(null);

  // Local preview of the chosen file (nothing is uploaded yet)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleChange = (event) => {
    const chosen = event.target.files?.[0];
    if (!chosen) return;

    const problem = validateImageFile(chosen);
    if (problem) {
      onError(problem);
      onSelect(null);
      event.target.value = '';   // clear the picker so the same file can be re-chosen later
      return;
    }

    onError('');
    onSelect(chosen);
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = '';
    onError('');
    onClear();
  };

  const shown = previewUrl || currentImage;

  return (
    <div className="md:col-span-3 rounded-2xl border-2 border-dashed border-zinc-400 bg-white p-4">
      <label className="block text-sm font-semibold text-zinc-900" htmlFor="product-image">Product image</label>
      <p className="text-xs text-zinc-500">JPG, PNG or WEBP · max 5 MB</p>

      <div className="mt-3 flex flex-wrap items-start gap-4">
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-zinc-300 bg-zinc-100">
          {shown ? (
            <img src={shown} alt="Product preview" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-zinc-500">No image</span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <input
            ref={inputRef}
            id="product-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="block text-sm text-zinc-900"
          />
          {file && (
            <p className="text-xs text-emerald-700">
              New image selected: {file.name} — it will be uploaded when you save.{' '}
              <button type="button" onClick={handleClear} className="underline">Clear</button>
            </p>
          )}
          {!file && currentImage && (
            <p className="text-xs text-zinc-600">
              Showing the current image.{' '}
              {onRemoveCurrent && <button type="button" onClick={onRemoveCurrent} className="text-red-700 underline">Remove image</button>}
            </p>
          )}
          {error && <p role="alert" className="alert-error !px-3 !py-2 !text-xs">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductImageInput;
