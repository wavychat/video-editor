import React from "react";
import { Story, Meta } from "@storybook/react";

import { EditorProps, VideoEditor } from "../VideoEditor";

export default {
	title: "Final/VideoEditor",
	component: VideoEditor,
} as Meta;

const Template: Story<EditorProps> = (args) =>
	<VideoEditor {...args} />;

export const Primary = Template.bind({});
Primary.args = {
	videoUrl: "./test.mp4",
};
