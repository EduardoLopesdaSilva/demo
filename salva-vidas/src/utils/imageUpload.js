const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_MAX_SIZE_BYTES = 1024 * 1024;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Nao foi possivel ler a imagem selecionada."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Nao foi possivel preparar a imagem selecionada."));
    image.src = source;
  });
}

function calculateSizeFromBase64(dataUrl) {
  const base64 = (dataUrl.split(",")[1] || "").replace(/=+$/, "");
  return Math.floor((base64.length * 3) / 4);
}

function getTargetSize(width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

function canvasToDataUrl(canvas, quality) {
  return canvas.toDataURL("image/jpeg", quality);
}

export async function prepareImageFile(
  file,
  {
    maxDimension = DEFAULT_MAX_DIMENSION,
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  } = {}
) {
  if (!file) {
    throw new Error("Selecione uma imagem para continuar.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Envie apenas arquivos de imagem.");
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const targetSize = getTargetSize(image.width, image.height, maxDimension);

  const canvas = document.createElement("canvas");
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Nao foi possivel preparar a imagem no navegador.");
  }

  context.drawImage(image, 0, 0, targetSize.width, targetSize.height);

  let quality = 0.9;
  let preparedDataUrl = canvasToDataUrl(canvas, quality);

  while (calculateSizeFromBase64(preparedDataUrl) > maxSizeBytes && quality > 0.45) {
    quality -= 0.1;
    preparedDataUrl = canvasToDataUrl(canvas, quality);
  }

  const sizeBytes = calculateSizeFromBase64(preparedDataUrl);

  if (sizeBytes > maxSizeBytes) {
    throw new Error("A imagem preparada ainda ficou muito grande. Tente outra foto mais leve.");
  }

  return {
    dataUrl: preparedDataUrl,
    sizeBytes,
    width: targetSize.width,
    height: targetSize.height,
    originalName: file.name,
  };
}

export function formatImageSize(sizeBytes) {
  if (!sizeBytes) {
    return "0 KB";
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
