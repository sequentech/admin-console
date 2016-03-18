/**
 * Generic election related constraints that apply to multiple parts of
 * the deployment, for example the same limit might apply to authapi,
 * agora-gui and agora-elections
 */
angular.module('avAdmin')
  .factory(
    'ElectionLimits',
    function()
    {
      return {
        // maximum number of questions allowed in an election
        maxNumQuestions: 20,

        // maximum number of allowed possible answers in a question
        maxNumAnswers: 10000,

        // maximum size in characters of long strings like url titles
        maxShortStringLength: 300,

        // maximum size in characters of long strings like question description
        maxLongStringLength: 3000
      };
    }
  );