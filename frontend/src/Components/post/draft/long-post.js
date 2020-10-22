import React, { useState } from 'react';
import LongEditor from '../editor/long-editor';
import ReviewPost from './review-post';

const LongPost = (props) => {
  const [windowState, setWindowState] = useState("initial");
  const [hasContent, setHasContent] = useState(props.onlineDraft !== null);
  const [isSavePending, setSavePending] = useState(false);
  const [localDraft, setLocalDraft] = useState(props.onlineDraft);

  const handleSavePending = (currentlySaving) => {
    setSavePending(currentlySaving);
  }

  const syncChanges = () => {
    props.onLocalOnlineSync(localDraft)
      .then((result) => {
        if (result) {
          console.log("SAVING SIDE WAY");
          setSavePending(false);
        }
        else {
          alert("Save unsucessful");
        }
      }
      );
  }

  const setPostStage = (windowType, isSavePending) => {
    if (isSavePending) {
      if (!window.confirm("Do you want to leave while changes are being saved?")) {
        syncChanges();
      }
      else {
        //don't care, just leave
        if (windowType === "none") {
          props.onPostTypeSet(windowType, null);
        }
        else {
          //go to review page
          setWindowState(windowType);
        }

      }
    }
    else {
      if (windowType === "none") {
        props.onPostTypeSet(windowType, localDraft);
      }
      else if (windowType === "initial") {
        setWindowState(windowType);
      }
      //already saved, just set the local state
      else if (windowType === "review") {
        setWindowState(windowType);
        props.onLocalSync(localDraft);
      }
      else {
        setWindowState(windowType);
      }
    }
  }
  if (windowState === "initial")
    return (
      <div className="long-post-window">
        <div>
          <h2>Long Entry</h2>
          {isSavePending ? (<p>Saving</p>) : (<p>Saved</p>)}
          <div id="button-container">
            <span id="toggle-button-span">
              <button id="toggle-button" value="none" onClick={e => setPostStage(e.target.value, isSavePending)}>Return</button>
            </span>
            <span id="post-button-span">
              <button id="post-button" value="review" disabled={!hasContent} onClick={(e) => setPostStage(e.target.value, isSavePending)}>Review Post</button>
            </span>
          </div>
        </div>
        {props.onlineDraftRetrieved && !props.loading ?
          (<LongEditor
            username={props.username}
            isSavePending={isSavePending}
            hasContent={hasContent}
            setHasContent={setHasContent}
            onSavePending={handleSavePending}
            onlineDraft={props.onlineDraft}
            localDraft={localDraft}
            syncChanges={syncChanges}
            setLocalDraft={setLocalDraft}
          />)
          : (
            <div>
              <p> Loading.... </p>
            </div>
          )
        }

      </div>
    );
  else {
    return (
      <ReviewPost
        displayPhoto={props.displayPhoto}
        isPaginated={false}
        postText={props.onlineDraft}
        closeModal={props.closeModal}
        postType="LONG"
        setPostStage={setPostStage}
        username={props.username}
        preferredPostType={props.preferredPostType}
        pursuits={props.pursuits}
        handlePreferredPostTypeChange={props.handlePreferredPostTypeChange}
      />
    )
  }
}

export default LongPost;