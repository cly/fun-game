app.templates = {
'user/userImageSmall': "<a class=\"span2 user-img-link\" href=\"<%= user.getId() %>\" title=\"<%= user.getName() %>\">\n    <img class=\"user-img-small\" src=\"<%= user.getImageUrl('square') %>\" alt=\"Picture of <%= user.getName() %>\">\n</a>\n\n",
'user/userImageMedium': "<img class=\"user-img\" src=\"<%= user.getImageUrl('square') %>\" alt=\"Picture of <%= user.getName() %>\">\n",
'game/main': "<div style=\"width:500px; margin: 50px auto\">\n<h4>\nAlice and Bob has robbed the Bank of Canada of $10Million bucks :( Now, they are trying to get away!\n</br>\n\nFortunately, the RCMP has tracked them down, but where's the loot?\n</br>\n\nThe RCMP has decided to interrogate Alice and Bob separately.\n</br>\n\nIf Alice and Bob both stay quiet, they will be freed and will split the $10M. ($5M each)\n</br>\nIf Alice rats out Bob while Bob's silent, Alice will end up with the $2M she stashed away in her igloo. Bob will go to jail.\n</br>\nIf Bob rats out Alice while Alice's silent, Bob will end up with the $2M he stashed away in the beaver dam. Alice will go to jail.\n</br>\nIf Alice and Bob both rats each other out, they will both go to jail.\n</br>\n</br>\n\nAlice needs your help. What should she do? Costs $1 to play.\n\n</br>\n<a class=\"btn\" id=\"cooperate\" href=\"/cooperate\">Stay quiet</a>\n</br>\n<a class=\"btn\" id=\"betray\" href=\"/betray\">Rat him out!</a>\n\n<div id=\"results\">\n<%= new Date() %>\n</br>\n<% if (game.getMyAction() == 'cooperate' && game.getFriendAction() == 'cooperate') { %>\n      (+$5M) WOOT! Alice and Bob worked well together to dodge the coppers.\n<% } else if (game.getMyAction() == 'cooperate' && game.getFriendAction() == 'betray') { %>\n      Alice kept her mouth shut but Bob betrayed her :(\n<% } else if (game.getMyAction() == 'betray' && game.getFriendAction() == 'betray') { %>\n      Two rats don't make a right. Both Alice and Bob goes to jail for a long time.\n<% } else if (game.getMyAction() == 'betray' && game.getFriendAction() == 'cooperate') { %>\n      (+$2M) Alice played Bob like a doll. Well done!\n<% } %>\n\n</br>\n<span class=\"label label-info\">Alice's winnings: $<%= game.getMyWinnings() %></span>\n</br>\n<span class=\"label label-info\">Bob's winnings: $<%= game.getFriendWinnings() %></span>\n<!--\n        <li>Alice's action: <%= game.getMyAction() %></li>\n        <li>Bob's action:  <%= game.getFriendAction() %></li>\n-->\n</div>\n</h3>\n</h4>\n"};