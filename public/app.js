var id = (Math.random().toString(36)+'00000000000000000').slice(2, 15+2);

var messages = [
  {content: 'Hi Daniel!', sender: {name: 'Jerry', id: id}, sentByUser: true},
  {content: 'Sup dude?', sender: {name: 'Daniel', id: 'somethingelse'}},
  {content: 'Chilling, trying to learn React', sender: {name: 'Jerry', id: id}, sentByUser: true},
  {content: 'Aight, I\'m going to hit the gym in an hour, wanna join?', sender: {name: 'Daniel', id: 'somethingelse'}},
  {content: 'Nah mate, totally hungover :p', sender: {name: 'Jerry', id: id}, sentByUser: true},
  {content: 'Dawg, you lazy. Remember the last time you skipped your leg day? You ended up programming PHP 3.0 for a whole week and had to optimise the app for IE 5.0. Wanna try that again?', sender: {name: 'Daniel', id: 'somethingelse'}}
];

var users = [
  {name: 'Jerry'},
  {name: 'Daniel'},
  {name: 'Tommi'},
  {name: 'Sami'}
];

var chats = [];

var socket = io.connect('http://localhost:3000');

var ChatTitle = React.createClass({

  getInitialState: function() {
    var now = new Date();
    return {
      participants: 'Jerry, Daniel',
      lastMessage: { timestamp: now.toGMTString() }
    }
  },

  render: function() {
    return (
      <div className="chat-title">
        <h2>{this.state.participants}</h2>
        <h3>{this.state.lastMessage.timestamp}</h3>
      </div>
    );
  }
});

var ChatMessages = React.createClass({

  getInitialState: function() {
    return {
      messages: this.props.messages
    }
  },

  render: function() {
    this.props.messages.map(function(m) {
      m.class = m.sender.id === id ? 'sent-by-user message' : 'sent-by-other message';
    });

    return (
      <div className="chat-messages">
        {this.props.messages.map(function(m) {
          return <p className={m.class}>{m.content}</p>;
        })}
      </div>
    );
  }
});

var ChatField = React.createClass({
  send: function(e) {
    if (e.keyCode === 13) {
      var msgstr = document.getElementById('chat-field-input').value;
      var msg = ({content: msgstr, sender: {name: 'Jerry', id: id}, sentByUser: true});
      document.getElementById('chat-field-input').value = '';
      this.props.onUpdate(msg);
      socket.emit('msg', msg);
    }
  },
  render: function() {
    return (
      <div className="chat-field">
        <input type="text" id="chat-field-input" placeholder="Write your message here" onKeyDown={this.send}></input>
      </div>
    )
  }
});

var ChatBox = React.createClass({
  onUpdate: function(msg) {
    this.setState({
      messages: this.state.messages.concat(msg)
    })
  },
  getInitialState: function() {
    return {
      messages: messages
    }
  },
  componentDidMount: function() {
    var rthis = this;
    socket.on('msg', function(data) {
      console.log(this.state);
      if (data.sender.id !== id) {
        rthis.setState({
          messages: rthis.state.messages.concat(data)
        })
        console.log('got msg, appended it');
      }
    });
  },
  render: function() {
    return (
      <div className="chat">
        <ChatTitle />
        <ChatMessages messages={this.state.messages} />
        <ChatField onUpdate={this.onUpdate} />
      </div>
    );
  }
});

var LoginBox = React.createClass({
  send: function(e) {
    var name = document.getElementById('login-field-input').value;
    if (e.keyCode === 13) {
      React.render(
        <ChatBox messages={messages} name={name}/>,
        document.getElementById('chat-area')
      );
      React.render(
        <ActiveUsers />,
        document.getElementById('user-area')
      );
      socket.emit('login', {name: name, id: id});
    }
  },
  render: function() {
    return (
      <div className="login">
        <input type="text" id="login-field-input" placeholder="Who are you?" onKeyDown={this.send}></input>
      </div>
    );
  }
});

var ActiveUsers = React.createClass({
  addUser: function(u) {
    this.setState({
      users: this.state.users.concat(u)
    });
  },
  getInitialState: function() {
    return {
      users: users
    }
  },
  componentDidMount: function() {
    var app = this;
    socket.on('newuser', function(u) {
      console.log('new user!');
      app.addUser(u);
    });
  },
  render: function() {
    return (
      <div className="users">
        <ul>
          {this.state.users.map(function(u) {
            return <UserRow user={u}/>
          })}
        </ul>
      </div>
    );
  }
});

// Should colour code these, green for new messages, blue for active chat without new messages.
// White for non-initiated chat.
var UserRow = React.createClass({
  setActive: function() {
    var newChat = {};
    newChat.participants = [{name: this.props.user.name, id: this.props.user.id}, {id: id, name: 'todo'}];
    socket.emit('newchat', newChat);
  },
  render: function() {
    return <li onClick={this.setActive}>{this.props.user.name}</li>;
  }
})

React.render(
  <LoginBox />,
  document.getElementById('chat-area')
);
