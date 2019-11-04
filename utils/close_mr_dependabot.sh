#!/bin/bash
# Extract the host where the server is running, and add the URL to the APIs
[[ $HOST =~ ^https?://[^/]+ ]] && HOST="${BASH_REMATCH[0]}/api/v4/projects/"

# Require a list of all the merge request and take a look if there is already
# one with the same source branch
LISTMR=`curl --silent "${HOST}${CI_PROJECT_ID}/merge_requests?state=opened" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}"`;
COUNTBRANCHES=`echo ${LISTMR} | grep -o "\"source_branch\":\"${CI_COMMIT_REF_NAME}\"" | wc -l`;

# Delete Github MR for opened gitlab MR
if [ ${COUNTBRANCHES} -ne "0" ]; then
  echo "Exist gitlab MR for current branch"

  if [ -n ${MR_NUMBER_GITHUB} ]; then
    echo "Search github PR for ${CI_COMMIT_REF_NAME}"
    
    LIST_MR_GITHUB=`curl --silent "https://api.github.com/search/issues?q=state:open+head:${CI_COMMIT_REF_NAME}+repo:${GITHUB_OWNER}/${CI_PROJECT_NAME}" --header "Accept: application/vnd.github.v3+json"`;
    MR_NUMBER_GITHUB=`echo ${LIST_MR_GITHUB} | grep -o "\"number\": [[:digit:]]*" | grep -o "[[:digit:]]*"`;
    
    echo "Available github MR with number ${MR_NUMBER_GITHUB}"

    GITHUB_MR_BODY="{
        \"state\": \"closed\"
    }";

    curl -X PATCH "https://api.github.com/repos/${GITHUB_OWNER}/${CI_PROJECT_NAME}/pulls/${MR_NUMBER_GITHUB}" \
        --header "Accept: application/vnd.github.v3+json" \
        --header "Authorization: token ${GITHUB_TOKEN}" \
        --header "Content-Type: application/json" \
        --data "${GITHUB_MR_BODY}";
    exit;
  fi
fi

echo "No availbale MR for closing";