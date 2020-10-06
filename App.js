import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Alert,
  Clipboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  VESDK,
  Configuration,
  SerializationExportType,
  VideoFormat,
} from "react-native-videoeditorsdk";

export default class App extends Component {
  state = { imageUri: null, width: 0, height: 0 };
  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Videos",
      base64: false,
      exif: false,
      quality: 0.8,
    });
    return result;
  };

  editImage = async () => {
    let result = await this.pickImage();
    console.log(result);
    let exportOption = {
      serialization: {
        enabled: true,
        exportType: SerializationExportType.OBJECT,
      },
      filename: "export",
    };
    let configuration: Configuration = {
      forceCrop: true,
      export: exportOption,
    };
    // if (Platform.OS === "ios") {
    //   exportOption["filename"] = "export";
    //   configuration["export"] = exportOption;
    // } else {
    //   configuration["export"] = exportOption;
    // }

    if (result && !result.cancelled) {
      VESDK.openEditor({ uri: result.uri }, configuration)
        .then(async (editedImage) => {
          console.log(editedImage);

          this.setState({
            imageUri: editedImage.hasChanges ? editedImage.video : result.uri,
          });
        })
        .catch((err) => {
          console.log(err);

          // Alert.alert("Error", JSON.stringify(err));
          Clipboard.setString(JSON.stringify(err));
        });
    }
  };
  render() {
    return (
      <View style={styles.container}>
        {/* <Video source={{ uri: this.state.imageUri }} style={styles.image} /> */}
        <Button title="Choose Video" onPress={this.editImage} />
        <Text>{`${this.state.imageUri ? "Video selected" : "No video"}`}</Text>
        <Text>{`width:${this.state.width}-height:${this.state.height}`}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "50%",
    height: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
});
