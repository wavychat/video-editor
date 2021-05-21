import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";

export default function App() {
	return (
		<View style={{ flex: 1, marginTop: 20 }}>
			<WebView
				source={{ uri: "https://google.com" }}
				bounces={false}
				scrollEnabled={false}
				allowsInlineMediaPlayback
			></WebView>
		</View>
	);
}
