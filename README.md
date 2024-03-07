https://socket.io/docs/v4/tutorial/introduction

TODO: Add a socket.disconnect dev button to test disconnects.


# Collective Decision Algorithm
Goal: Figure out the optimal place in the fewest votes.

First, shuffle the choices to avoid obvious repetition. Since we're shuffling, we can stop when we find the first optimal candidate and still offer variety.

1. Give each user an item to vote for.
2. Sort the array by lowest number of negative votes and have the users vote again. Preserve initial sorting order for ties.
3. If an item can no longer be beat by any other item, it's the winner.

Calculating 3:
- The max score is num_users - min(number_of_no_votes_per_item)
- If an item's score equals the max score, it's a pick
