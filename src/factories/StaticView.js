/**
 * @author rik
 */
import _ from 'lodash';
import ObjectWithViewAndMiddleware from './ObjectWithViewAndMiddleware';

/**
 * @todo document
 * @todo implement ?
 * @extends ObjectWithView
 * @class StaticView
 */
const StaticView = ObjectWithViewAndMiddleware.extend({

  validate(options) {
    if (StaticView.staticViews[options.name]) {
      throw new Error(`Can't construct StaticView, StaticView with name '${options.name}' already defined.`);
    }
  },

  initialize() {
    StaticView.staticViews[this.options.name] = this;
  }

});

/**
 * @todo document
 * @type {{}}
 */
StaticView.staticViews = {};

export default StaticView;