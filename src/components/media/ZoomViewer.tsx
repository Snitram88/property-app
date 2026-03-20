import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { AppText } from '@/src/components/ui/AppText';
import { colors } from '@/src/theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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
}: ZoomViewerProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText style={styles.count}>
            {images.length ? `${imageIndex + 1} / ${images.length}` : 'Image'}
          </AppText>

          <Pressable style={styles.closeButton} onPress={onRequestClose}>
            <Ionicons name="close" size={24} color={colors.white} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: SCREEN_WIDTH * imageIndex, y: 0 }}
        >
          {images.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.slide}>
              <ScrollView
                style={styles.zoomWrap}
                contentContainerStyle={styles.zoomContent}
                maximumZoomScale={3}
                minimumZoomScale={1}
                centerContent
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Image source={image.uri} style={styles.image} contentFit="contain" />
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomWrap: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 110,
  },
  zoomContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 160,
  },
});
