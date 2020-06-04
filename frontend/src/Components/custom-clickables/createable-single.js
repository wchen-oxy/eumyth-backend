import React, { Component } from 'react';

import CreatableSelect from 'react-select/creatable';
import {components} from 'react-select';
import {options as pursuitOptions}  from './options';
// import { colourOptions } from '../data';

const Menu = props => {
  const optionSelectedLength = props.getValue().length || 0;
  return (
    <components.Menu {...props}>
      {optionSelectedLength < 5 ? (
        props.children
      ) : (
        <div>Max limit achieved</div>
      )}
    </components.Menu>
  );
};


export default class CustomMultiSelect extends Component {

 

  // handleChange(newValue, actionMeta){
  //   console.group('Value Changed');
  //     console.log(newValue);
  //     console.log(`action: ${actionMeta.action}`);
  //     console.groupEnd();
  // }
  isValidNewOption = (inputValue, selectValue) =>
        inputValue.length > 0 && selectValue.length < 5;
      
  render() {
    
    return (
      <CreatableSelect
        components={{ Menu }}
        isMulti
        onChange={this.props.onSelect}
        options={pursuitOptions}
        isValidNewOption={this.isValidNewOption}
      />
    );
  }
}