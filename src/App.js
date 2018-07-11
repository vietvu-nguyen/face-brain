import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js';



const particlesOption = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState ={
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
}

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data) =>{
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.emal,
        entries: data.entries,
        joined: data.joined
      }})
  }

  calculateFaceLocation = (data) =>{
   const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
   const image = document.getElementById('inputimage');
   const width = Number(image.width);
   const height = Number(image.height);
   return {
    leftCol: clarifaiFace.left_col*width,
    topRow: clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row * height)
   }
  }

  displayFaceBox = (box) => {
    // console.log(box)
    this.setState({box: box})
  }
  
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://frozen-eyrie-40157.herokuapp.com/imageUrl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response =>{
      if(response){
        fetch('https://frozen-eyrie-40157.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id,
          })
        })
          .then(response => response.json())
          .then(count =>{
              this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err))
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialState)
    } else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }
  render() {
    const {isSignedIn, imageUrl, box, route} = this.state;
    return (
      <div className="App">
          <Particles className='particles'
              params={particlesOption}
          />
         <Navigation isSignedIn={isSignedIn} onRouteChange ={this.onRouteChange} />
         { this.state.route === 'home'
         ? <div>
             <Logo />
             <Rank name = {this.state.user.name} entries = {this.state.user.entries}/>
             <ImageLinkForm onInputChange = {this.onInputChange}
             onButtonSubmit = {this.onButtonSubmit}/>
             <FaceRecognition box={box} imageUrl = {imageUrl}/>
            </div>
            : (
                route === 'signin' 
                ? <Signin loadUser ={this.loadUser} onRouteChange ={this.onRouteChange}/>
                : <Register loadUser ={this.loadUser} onRouteChange ={this.onRouteChange}/>
              )
         
         }
      </div>
    );
  }
}

export default App;