import React, { Component } from "react";
import * as Permissions from "expo-permissions";
import * as ImageManipulator from "expo-image-manipulator";

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
  PESDK,
  Configuration,
  SerializationExportType,
  VideoFormat,
} from "react-native-photoeditorsdk";

export default class App extends Component {
  state = { imageUri: null, width: 0, height: 0, status: null };

  askForPermssion = async (screenProps) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    console.log("status", status);
    if (status !== "granted") {
      Alert.alert(
        "Permision denied or undetermined",
        "Please allow access to the gallery to upload media " +
          `Permissions.CAMERA_ROLL = ${status}`
      );
    }
    this.setState({ status });
    return status;
  };
  pickImage = async () => {
    let status = await this.askForPermssion();
    let result = "";
    if (status === "granted") {
      result = await ImagePicker.launchImageLibraryAsync({
        base64: false,
        exif: false,
        mediaTypes: "All",
      });
    }
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
      PESDK.openEditor({ uri: result.uri }, configuration)
        .then(async (editedImage) => {
          editedImage = await ImageManipulator.manipulateAsync(
            editedImage.image
          );
          console.log(editedImage);
          this.setState({
            imageUri: editedImage,
            width: editedImage.width,
            height: editedImage.height,
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
        <Button title="Choose image" onPress={this.editImage} />
        <Text>{`${this.state.imageUri ? "Image selected" : "No image"}`}</Text>
        <Text>{`${`Permissions.CAMERA_ROLL = ${this.state.status}`}`}</Text>
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
