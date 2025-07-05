import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Modal, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';

interface ImagePreviewProps {
  imageUrl: string;
  fileName?: string;
  isOwnMessage: boolean;
  isDark: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  imageUrl, 
  fileName, 
  isOwnMessage, 
  isDark 
}) => {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const colors = isDark ? COLORS.dark : COLORS.light;
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


  const handleImagePress = () => {
    setShowFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setShowFullScreen(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <View 
        className="items-center justify-center rounded border-2 border-dashed p-4"
        style={{ 
          borderColor: colors.grey3, 
          backgroundColor: colors.grey5,
          height: 120,
          width: 200
        }}
      >
        <Ionicons name="image-outline" size={32} color={colors.grey2} />
        <Text className="mt-2 text-center text-xs" style={{ color: colors.grey2 }}>
          Image not available
        </Text>
        {fileName && (
          <Text className="mt-1 text-center text-xs" style={{ color: colors.grey3 }}>
            {fileName}
          </Text>
        )}
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8}>
        <View className="overflow-hidden rounded-lg">
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 200,
              height: 150,
              borderRadius: 8,
            }}
            resizeMode="cover"
            onError={handleImageError}
          />
          
          {/* Image overlay with expand icon */}
          <View
            className="absolute bottom-2 right-2 rounded-full p-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            <Ionicons name="expand-outline" size={16} color="white" />
          </View>
        </View>
        
        {/* Filename if available */}
        {fileName && (
          <Text
            className="mt-1 text-xs"
            style={{ 
              color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.grey2,
              textAlign: isOwnMessage ? 'right' : 'left'
            }}
          >
            {fileName}
          </Text>
        )}
      </TouchableOpacity>

      {/* Full-screen image modal */}
      <Modal
        visible={showFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseFullScreen}
      >
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          {/* Close button */}
          <TouchableOpacity
            className="absolute top-12 right-6 z-10 rounded-full p-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onPress={handleCloseFullScreen}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Full-screen image */}
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: screenWidth * 0.95,
              height: screenHeight * 0.8,
            }}
            resizeMode="contain"
          />

          {/* Image info */}
          {fileName && (
            <View
              className="absolute bottom-12 left-6 right-6 rounded-lg p-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            >
              <Text className="text-center text-white text-sm">
                {fileName}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

export default ImagePreview;