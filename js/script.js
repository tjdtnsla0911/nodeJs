$(function(){
  function get2digits (num){
    console.log(`get2digits()의 num =${num}`);
    return ('0' + num).slice(-2);
  }

  function getDate(dateObj){
    console.log(`getDate의 dateObj =${dateObj}`);
    if(dateObj instanceof Date)
    console.log('dateObj instanceof Date에 들어옴');
      return dateObj.getFullYear() + '-' + get2digits(dateObj.getMonth()+1)+ '-' + get2digits(dateObj.getDate());
  }

  function getTime(dateObj){
    console.log(`getTime의 dataObj = ${dateObj}`);
    if(dateObj instanceof Date)
    console.log(`dataObj instanceof Date`);
      return get2digits(dateObj.getHours()) + ':' + get2digits(dateObj.getMinutes())+ ':' + get2digits(dateObj.getSeconds());
  }

  function convertDate(){
    console.log(`converDate()에옴`);
    $('[data-date]').each(function(index,element){
      var dateString = $(element).data('date');
      if(dateString){
        console.log(`dateString은 true에옴 dateString =${dateString}`);
        var date = new Date(dateString);
        $(element).html(getDate(date));
      }
    });
  }

  function convertDateTime(){
    console.log(`convertDateTime()에옴`);
    $('[data-date-time]').each(function(index,element){
      var dateString = $(element).data('date-time');
      if(dateString){
        console.log(`dateString은 true 에옴 dateString =${dateString}`);
        var date = new Date(dateString);
        console.log(`date  =${date}`);
        $(element).html(getDate(date)+' '+getTime(date));
      }
    });
  }

  convertDate();
  convertDateTime();
});


$(function(){
  var search = window.location.search; // 1
  var params = {};

  if(search){ // 2
    $.each(search.slice(1).split('&'),function(index,param){
      var index = param.indexOf('=');
      if(index>0){
        var key = param.slice(0,index);
        var value = param.slice(index+1);

        if(!params[key]) params[key] = value;
      }
    });
  }

  if(params.searchText && params.searchText.length>=3){ // 3
    $('[data-search-highlight]').each(function(index,element){
      var $element = $(element);
      var searchHighlight = $element.data('search-highlight');
      var index = params.searchType.indexOf(searchHighlight);

      if(index>=0){
        var decodedSearchText = params.searchText.replace(/\+/g, ' '); //  3-1
        decodedSearchText = decodeURI(decodedSearchText);

        var regex = new RegExp(`(${decodedSearchText})`,'ig'); // 3-2
        $element.html($element.html().replace(regex,'<span class="highlighted">$1</span>'));
      }
    });
  }
});
