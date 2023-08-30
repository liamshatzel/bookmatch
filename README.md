# bookmatch
Simple website to help you match with your next book to read.

About:
-  The books are pulled from the Google Books API.
-  To accomodate for the union of user inputs rather than taking an intersection, each input the user enters into the text boxes are as seperate API queries.
-  Another more specific query of the intersection of all three inputs is performed for more precise results. All of these results are then aggregated.
-  In order to find matches, information about the books are hashed into specific hash maps and collisions are counted based on likes.
-  Taking these properties it performs a new query and matches the user with a random book from the new query list.

![image](https://github.com/liamshatzel/bookmatch/assets/77510623/c06f3c48-4af1-41df-b159-667232aff51b)
