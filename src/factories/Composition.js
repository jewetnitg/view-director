import _ from 'lodash';
import FactoryFactory from 'frontend-factory';
import ObjectWithViewAndMiddleware from './ObjectWithViewAndMiddleware';
import StaticView from './StaticView';

/**
 * @todo document
 * @class Composition
 */
const Composition = ObjectWithViewAndMiddleware.extend({

  name: 'Composition',

  defaults: {},

  validate: ['route'],

  initialize() {
    this.options.name = this.options.name || this.options.route;
    Composition.compositions[this.options.name] = this;
  },

  prototype: {

    /**
     * @todo document
     * @todo implement
     * @param params
     * @param data
     * @param force
     * @returns {Promise}
     */
    render(params = {}, data = {}, force = false) {
      return Promise.all([
        ObjectWithViewAndMiddleware.prototype.render.call(this, params, data, force),
        runStaticViews('render', this.staticViews, [params, data, force])
      ]);
    },

    /**
     * @todo document
     * @param data
     */
    sync(data) {
      ObjectWithViewAndMiddleware.prototype.sync.call(this, data);
      runStaticViews('sync', this.staticViews, [data]);
    },

    /**
     * @todo document
     */
    hide() {
      ObjectWithViewAndMiddleware.prototype.hide.call(this);
      runStaticViews('hide', this.staticViews);
    },

    /**
     * @todo document
     */
    show() {
      ObjectWithViewAndMiddleware.prototype.show.call(this);
      runStaticViews('show', this.staticViews);
    }

  }

});

/**
 * @todo document
 * @type {Object<Composition>}
 */
Composition.compositions = {};

/**
 * @todo document
 * @param composition
 * @returns {*}
 */
Composition.ensure = function (composition) {
  if (typeof composition === 'string') {
    const _composition = _.get(Composition.compositions, composition);

    if (!_composition) {
      throw new ReferenceError(`Couldn't not ensure composition '${composition}', composition not defined.`);
    }

    return _composition;
  } else if (composition instanceof Composition) {
    return composition;
  } else if (typeof composition === 'object') {
    return _.find(Composition.compositions, _composition => {
        return _.eq(_composition.options, composition);
      }) || Composition(composition);
  } else {
    console.error('Composition.ensure argument', composition);
    throw new TypeError(`Could not ensure composition, invalid composition provided.`);
  }
};

// @todo refactor to StaticView ?
function runStaticViews(type, staticViews = [], args = []) {
  return _.map(staticViews, (name) => {
    const staticView = StaticView.staticViews[name];

    if (!staticView) {
      throw new ReferenceError(`StaticView with '${name}' doesn't exist.`);
    }

    return staticView[type].apply(staticView, args);
  });
}


export default Composition;
