import React from "react";
import { Story, Meta } from "@storybook/react";

import { VideoEditor } from "../VideoEditor";

export default {
	title: "Example/VideoEditor",
	component: VideoEditor,
} as Meta;

const Template: Story = (args) =>
	<VideoEditor />;

export const Primary = Template.bind({});
Primary.args = {};
