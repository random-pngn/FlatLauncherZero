const ReactDOM = require('react-dom');
const React = require('react');

class TextForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    this.props.onChange({key: this.props.name, value: event.target.value});
  }

  render() {
    return (
      <div className="field">
        <label>
          {this.props.label}
          <div className="ui left pointing label">
            {this.props.desc}
          </div>
        </label>
        <input
          type="text"
          placeholder={this.props.holder}
          onChange={this.handleChange}
          />
      </div>
    );
  }
}

class JSONForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {json: {}};

    this.post = this.post.bind(this);
  }

  post(item) {
    console.log(this.state.json, "//", item);
    let json = this.state.json;
    json[item.key] = item.value;
    this.setState({"json":json});
    console.log(JSON.stringify(this.state.json));
  }

  render() {
    return (
      <div className="ui container centered padded">
        <div className="ui segment">
          <div className="ui header dividing large">Setting Exporter</div>
          <form className="ui fluid form">
            <div className="ui header block">Requirement</div>
            <div className="two fields">
              <TextForm name="name" onChange={this.post} desc="製品の名前"
                label="Product Name" holder="MyProductName"/>
              <TextForm name="developer" onChange={this.post} desc="開発者"
                label="Developer Organization" holder="(c) MyTeam.inc"/>
            </div>

            <div className="ui header block small">Path</div>
            <div className="three fields">
              <TextForm name="exec" onChange={this.post} desc="実行ファイルのパス"
                label="Exe Path" holder="MyApp.exe"/>
              <TextForm name="snapshot" onChange={this.post} desc="スクリーンショットのパス"
                label="Snapshot" holder="MyScreenShot.png"/>
              <TextForm name="readme" onChange={this.post} desc="製品の説明文のパス"
                label="Readme" holder="README.md"/>
            </div>

            <div className="ui header block small">Option</div>
            <div className="three fields">
              <TextForm name="tags" onChange={this.post} desc="タグのリスト (スペースで区切られます)"
                label="Tags" holder="Game Unity Action RPG"/>
              <TextForm name="time" onChange={this.post} desc="予想される時間 (任意)"
                label="Time" holder="10 min ~ 30 min"/>
              <TextForm name="difficulty" onChange={this.post} desc="プレイの難しさ (任意)"
                label="Difficulty" holder="very Easy"/>
            </div>

            <div className="ui header block inverted">Export</div>
            <div className="field">
              <textarea rows="4" value={JSON.stringify(this.state.json)}></textarea>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

class SwitchRender extends React.Component {

  constructor(props) {
    super(props);
    this.state = {"isRender" : false};

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.$trigger = $(this.props.target);
    this.$trigger.on('click', this.handleClick);
  }

  componentWillUnmount() {
    this.$trigger.off('click', this.handleClick);
  }

  handleClick(e) {
    this.setState({"isRender" : !this.state.isRender});
  }

  render() {
      if(this.state.isRender) {
        return this.props.content;
      }
      return (<div></div>);
  }
}

console.log(React, ReactDOM);
ReactDOM.render(
  <SwitchRender target=".ForEditor" content={<JSONForm />}/>,
  document.getElementById('root')
);
