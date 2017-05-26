import React, { Component } from "react";
import styled from "styled-components";

const CommandBar = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  justify-content: space-between;
`;

const CommandBarButton = styled.button`
  font-size: 12px;
  background: white;
  border: none;
  cursor: pointer;
  padding: 10px;

  &:hover {
    background: #ddd;
  }
`;

const SlideCommandBar = props => (
  <CommandBar>
    <CommandBarButton onClick={props.createSlideAbove}>
      + Above
    </CommandBarButton>
    <CommandBarButton onClick={props.createSlideBelow}>
      + Below
    </CommandBarButton>
    <CommandBarButton onClick={props.deleteSlide}>
      Delete
    </CommandBarButton>
    <CommandBarButton onClick={props.moveSlideUp}>
      Move Up
    </CommandBarButton>
    <CommandBarButton onClick={props.moveSlideDown}>
      Move Down
    </CommandBarButton>
  </CommandBar>
);

const SlideControl = props => {
  const MarkdownControl = CMS.getWidget("markdown").control;
  return (
    <div>
      <h3>Slide</h3>
      <SlideCommandBar {...props.commandBarActions} />
      <MarkdownControl
        value={props.value}
        onChange={props.onChange}
        onAddAsset={props.onAddAsset}
        onRemoveAsset={props.onRemoveAsset}
        getAsset={props.getAsset}
      />
    </div>
  );
}

const SlidePreview = props => {
  const MarkdownPreview = CMS.getWidget("markdown").preview;
  return <div><hr /><MarkdownPreview {...props} /></div>;
};

const slideSeparator = "\n\n<!--s-->\n\n";
const slideSeparatorRegex = /\n\n<!--s-->\n\n/

const getSlideActions = (onChange, slides, i) => {
  const slidesCopy = slides.slice();
  return {
    createSlideAbove: () => {
      slidesCopy.splice(i, 1, "", slides[i]);
      return onChange(slidesCopy);
    },
    createSlideBelow: () => {
      slidesCopy.splice(i + 1, 0, "");
      return onChange(slidesCopy);
    },
    deleteSlide: () => {
      slidesCopy.splice(i, 1);
      return onChange(slidesCopy);
    },
    moveSlideUp: () => {
      if (i === 0) {
        return onChange(slides);
      }
      slidesCopy.splice(i - 1, 2, slides[i], slides[i - 1]);
      return onChange(slidesCopy);
    },
    moveSlideDown: () => {
      if (i === slides.length) {
        return onChange(slides);
      }
      slidesCopy.splice(i, 2, slides[i + 1], slides[i]);
      return onChange(slidesCopy);
    }
  };
};

export class SlidesControl extends Component {
  constructor(props) {
    super(props);
  }

  handleSlideChange(value, i) {
    const newValues = this.getValue().split(slideSeparatorRegex);
    newValues[i] = value;
    this.props.onChange(newValues.join(slideSeparator));
  }

  getValue () {
    return (this.props.value) ? this.props.value : "";
  }

  getSlideControls() {
    return this.getValue()
      .split(slideSeparatorRegex)
      .map((slideContent, i) => (
        <SlideControl
          key={i}
          value={slideContent}
          onChange={value => this.handleSlideChange(value, i)}
          commandBarActions={this.getCommandBarFunctionsForSlide(i)}
          onAddAsset={this.props.onAddAsset}
          onRemoveAsset={this.props.onRemoveAsset}
          getAsset={this.props.getAsset}
        />
      ));
  }

  getCommandBarFunctionsForSlide(i) {
    return getSlideActions(
      slides => {
        this.props.onChange(slides.join(slideSeparator));
      },
      this.getValue().split(slideSeparatorRegex),
      i
    );
  }

  render() {
    return (
      <div>
        {this.getSlideControls()}
      </div>
    );
  }
}

export const SlidesPreview = props => (
  <div>
    {props.value
      .split(slideSeparatorRegex)
      .map((val, i) => <SlidePreview key={i} value={val} />)}
  </div>
);
