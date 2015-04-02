var assert = require('assert')
  , _ = require('underscore')
  , helpers = require('../../helpers')

describe('dsp.tabread~', function() {

  afterEach(function() { helpers.afterEach() })

  describe('constructor', function() {

    it('should have value 0 by default', function(done) {
      var patch = Pd.createPatch()
        , array = patch.createObject('array', ['BLA', 4])
        , dac = patch.createObject('dac~')
        , tabread
      array.setData(new Float32Array([1, 2, 3, 4]))
      tabread = patch.createObject('tabread~', ['BLA'])

      helpers.expectSamples(function() {
        tabread.o(0).connect(dac.i(0))
      }, [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ], done)
    })

    it('should be possible to create the tabread before the corresponding array', function() {
      var patch = Pd.createPatch()
        , dac = patch.createObject('dac~')
        , tabread = patch.createObject('tabread~', ['BLO'])
        , array

      array = patch.createObject('array', ['BLO', 4])
      array.setData(new Float32Array([1, 2, 3, 4]))
      assert.equal(tabread.array.resolved, array)
    })

  })

  describe('i(0)', function() {

    it('should read at the position given by the first inlet', function(done) {
      var patch = Pd.createPatch()
        , array = patch.createObject('array', ['BLI', 10])
        , tabread
        , line = patch.createObject('line~')
        , dac = patch.createObject('dac~')

      array.setData(new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]))
      tabread = patch.createObject('tabread~', ['BLI'])

      helpers.expectSamples(function() {
        tabread.o(0).connect(dac.i(0))
        line.o(0).connect(tabread.i(0))
        line.i(0).message([0])
        line.i(0).message([5, 10 / Pd.getSampleRate() * 1000])
      }, [
        [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ], done)
    })
    
    // This is not possible to test before we can suspend the OfflineAudioContext,
    // because here no matter when we modify the array.data, it is taken into account
    // by the actual node, only when audio is started.
    it.skip('should be possible to modify the array', function(done) {
      var patch = Pd.createPatch()
        , array = patch.createObject('array', ['BLU', 10])
        , tabread = tabread = patch.createObject('tabread~', ['BLU'])
        , line = patch.createObject('line~')
        , dac = patch.createObject('dac~')
      
      helpers.expectSamples(function() {
        tabread.o(0).connect(dac.i(0))
        line.o(0).connect(tabread.i(0))
        line.i(0).message([0])
        line.i(0).message([5, 10 / Pd.getSampleRate() * 1000])
        array.setData(new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]))
      }, [
        [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ], done)
    })

  })

})