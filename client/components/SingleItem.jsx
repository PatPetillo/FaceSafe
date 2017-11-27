import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { getSingleItemRecipeToStore, clearSingleItemRecipeFromStore } from '../store/recipe';
import ReactLoading from 'react-loading';

class SingleItem extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.getSingleItemRecipeToStore(this.props.match.params.id)
  }

  componentWillUnmount() {
    this.props.clearSingleItemRecipeFromStore();
  }
  render() {
    const singleItem = this.props.fridge.filter(item => item.id === +this.props.match.params.id);
    const recipes = this.props.recipe.singleItemRecipes;
    return (
      <div className="singleItem">
        <p>{singleItem.length && singleItem[0].name.toUpperCase()}</p>
        <img src={singleItem.length && singleItem[0].image} alt="Yuchen's fault" />
        <div>
          {recipes.length ? recipes.map(recipe => <div key={recipe.image}><NavLink to={`/${recipe.name.split(' ').join('')}`}>{recipe.name}</NavLink></div>)
          :
          (
          <div>
          <div className="react-loading" >
            <ReactLoading type="spinningBubbles" color="#7df096" height="50px" width="50px" />
          </div>
          <div className="center">Searching for recipes...</div>
        </div>
        )
          }
        </div>
      </div>
    );
  }
}

const mapState = ({ fridge, recipe }) => ({ fridge, recipe });
const mapDispatch = { getSingleItemRecipeToStore, clearSingleItemRecipeFromStore };
export default connect(mapState, mapDispatch)(SingleItem);

