import ImageViewing from 'react-native-image-viewing';

type ZoomViewerProps = {
  visible: boolean;
  imageIndex: number;
  images: { uri: string }[];
  onRequestClose: () => void;
  onImageIndexChange?: (index: number) => void;
};

export function ZoomViewer({
  visible,
  imageIndex,
  images,
  onRequestClose,
  onImageIndexChange,
}: ZoomViewerProps) {
  return (
    <ImageViewing
      images={images}
      imageIndex={imageIndex}
      visible={visible}
      onRequestClose={onRequestClose}
      onImageIndexChange={(index) => onImageIndexChange?.(index ?? 0)}
      swipeToCloseEnabled
      presentationStyle="fullScreen"
      backgroundColor="#000000"
    />
  );
}
