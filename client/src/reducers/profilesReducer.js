import * as TYPES from "../constants/actionTypes";


// Object of form:
// {
//   id: {
//      requstersSize: num,
//      votersSize: num,
//      title: str,
//      consensusPercentage: num,
//      profileId: str
//      accountAddress: str
//    }, ...
// }
const initialState = {
};


function profilesReducer(state = initialState, action) {
  if (action.type === TYPES.PROFILE_RECEIVED) {
    const profileId = action.payload.result.profileId;
    return {
      ...state,
      [profileId]: {
        ...state[profileId],
        ...action.payload.result
      },
    };
  }

  // TODO: delete from storage on delete

  return state;
}

export default profilesReducer;
