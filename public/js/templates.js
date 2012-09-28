app.templates = {
'user/userImageSmall': "<a class=\"span2 user-img-link\" href=\"<%= user.getId() %>\" title=\"<%= user.getName() %>\">\n    <img class=\"user-img-small\" src=\"<%= user.getImageUrl('square') %>\" alt=\"Picture of <%= user.getName() %>\">\n</a>\n\n",
'user/userImageMedium': "<img class=\"user-img\" src=\"<%= user.getImageUrl('square') %>\" alt=\"Picture of <%= user.getName() %>\">\n",
'game/helloWorld': "hello world\n"};