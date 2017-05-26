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

class SlideControl extends Component {
  constructor(props) {
    super(props);
  }

  handleChange(e) {
    console.log(e.target.value);
    this.props.onChange(e.target.value);
  }

  render() {
    const MarkdownControl = CMS.getWidget("markdown").control;
    return (
      <div>
        <h1>Slide</h1>
        <SlideCommandBar {...this.props.commandBarActions} />
        <MarkdownControl
          value={this.props.value}
          onChange={this.props.onChange}
          onAddAsset={this.props.onAddAsset}
          onRemoveAsset={this.props.onRemoveAsset}
          getAsset={this.props.getAsset}
        />
      </div>
    );
  }
}

const SlidePreview = props => {
  const MarkdownPreview = CMS.getWidget("markdown").preview;
  return <div><hr /><MarkdownPreview {...props} /></div>;
};

const slideSeparator = "<!--s-->";

const getSlideActions = (onChange, slides, i) => {
  const slidesCopy = slides.slice();
  return {
    createSlideAbove: () => {
      console.log(`createSlideAbove slides[${i}]: ${slides[i]}`);
      slidesCopy.splice(i, 1, "", slides[i]);
      return onChange(slidesCopy);
    },
    createSlideBelow: () => {
      console.log(`createSlideBelow slides[${i}]: ${slides[i]}`);
      slidesCopy.splice(i + 1, 0, "");
      return onChange(slidesCopy);
    },
    deleteSlide: () => {
      console.log(`deleteSlide slides[${i}]: ${slides[i]}`);
      slidesCopy.splice(i, 1);
      return onChange(slidesCopy);
    },
    moveSlideUp: () => {
      console.log(`moveSlideUp slides[${i}]: ${slides[i]}`);
      if (i === 0) {
        return onChange(slides);
      }
      slidesCopy.splice(i - 1, 2, slides[i], slides[i - 1]);
      return onChange(slidesCopy);
    },
    moveSlideDown: () => {
      console.log(`moveSlideDown slides[${i}]: ${slides[i]}`);
      if (i === slides.length) {
        return onChange(slides);
      }
      slidesCopy.splice(i, 2, slides[i + 1], slides[i]);
      return onChange(slidesCopy);
    }
  };
};

window.getSlideActions = getSlideActions;

export class SlidesControl extends Component {
  constructor(props) {
    super(props);
  }

  handleSlideChange(value, i) {
    const newValues = this.props.value.split(slideSeparator);
    newValues[i] = value;
    console.log(newValues.join(slideSeparator));
    this.props.onChange(newValues.join(slideSeparator));
  }

  slideControlsFromMarkdown(markdown) {
    return markdown
      .split(slideSeparator)
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
        console.log(slides);
        this.props.onChange(slides.join(slideSeparator));
      },
      this.props.value.split(slideSeparator),
      i
    );
  }

  render() {
    return (
      <div>
        {this.slideControlsFromMarkdown(this.props.value)}
      </div>
    );
  }
}

export const SlidesPreview = props => (
  <div>
    {props.value
      .split(slideSeparator)
      .map((val, i) => <SlidePreview key={i} value={val} />)}
  </div>
);
