#!/bin/bash
# Extract the host where the server is running, and add the URL to the APIs
[[ $HOST =~ ^https?://[^/]+ ]] && HOST="${BASH_REMATCH[0]}/api/v4/projects/"

# Default branch
TARGET_BRANCH=`curl --silent "${HOST}${CI_PROJECT_ID}" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" | python3 -c "import sys, json; print(json.load(sys.stdin)['default_branch'])"`;

echo "Current branch"
echo ${CI_COMMIT_REF_NAME}

echo "Fetch git data"
git fetch -p

# Debatable decision, but it is necessary to obtain live information
echo "Rebase on default branch"
git rebase origin/${TARGET_BRANCH}

# Require a list of all the merge request and take a look if there is already
# one with the same source branch
LISTMR=`curl --silent "${HOST}${CI_PROJECT_ID}/merge_requests?state=opened" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}"`;
COUNTBRANCHES=`echo ${LISTMR} | grep -o "\"source_branch\":\"${CI_COMMIT_REF_NAME}\"" | wc -l`;

# Create MR
if [ ${COUNTBRANCHES} -eq "0" ]; then
    # The description of our new MR
    GITLAB_MR_BODY="{
        \"id\": ${CI_PROJECT_ID},
        \"source_branch\": \"${CI_COMMIT_REF_NAME}\",
        \"target_branch\": \"${TARGET_BRANCH}\",
        \"remove_source_branch\": true,
        \"title\": \"${CI_COMMIT_REF_NAME}\",
        \"assignee_id\":\"${GITLAB_USER_ID}\"
    }";

    curl -X POST "${HOST}${CI_PROJECT_ID}/merge_requests" \
        --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" \
        --header "Content-Type: application/json" \
        --data "${GITLAB_MR_BODY}";

    echo "Opened a new merge request: ${CI_COMMIT_REF_NAME} and assigned to you";
    exit;
fi

echo "No new merge request opened";