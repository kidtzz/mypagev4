---
ShareButtons:
- linkedin
- whatsapp
- twitter
ShowReadingTime: true
date: "2023-11-23T09:52:07+07:00"
draft: false
tags:
- python
title: Python Method
---



**Python Method**

1. **String Methods**

    ```go
    str.capitalize():  #Returns a copy of the string with its first character capitalized.

    str.upper():   #Converts all characters in the string to uppercase.

    str.lower():   #Converts all characters in the string to lowercase.

    str.strip():  #Returns a copy of the string with leading and trailing whitespace removed.

    str.split(separator):  #Splits the string into a list of substrings based on the specified separator.

    str.join(iterable):  #Joins the elements of an iterable (e.g., a list) into a string using the string as a separator.
    ```

2. **List Methods**

    ```go
    list.append(element):  #Adds an element to the end of the list.

    list.extend(iterable): #Extends the list by appending elements from the iterable.

    list.insert(index, element):  #Inserts an element at the specified index.

    list.remove(element):  #Removes the first occurrence of the specified element from the list.

    list.pop(index):  #Removes and returns the element at the specified index. If no index is specified, removes and returns the last element.

    list.index(element):  #Returns the index of the first occurrence of the specified element.

    list.sort():  #Sorts the elements of the list in ascending order.

    list.reverse(): #Reverses the order of the elements in the list.
    ```

3. **Dictionary Methods**

     ```go
     dict.keys():  #Returns a view of all keys in the dictionary.

     dict.values():  #Returns a view of all values in the dictionary.

     dict.items():  #Returns a view of all key-value pairs in the dictionary.

     dict.get(key, default):  #Returns the value for the specified key. If the key is not found, it returns the default value.

     dict.pop(key):  #Removes the item with the specified key and returns its value.

     dict.update(iterable):  #Updates the dictionary with elements from another iterable or dictionary.
     ```

4. **File Methods**

     ```go
     open(filename, mode):  #Opens a file and returns a file object.

     file.read(size):  #Reads and returns the specified number of characters from the file.

     file.readline():  #Reads a single line from the file.

     file.readlines():  #Reads all lines from the file and returns them as a list.
      ```

5. **Other Common Methods**

     ```go
     len(iterable):  #Returns the number of items in an iterable (e.g., a list, string, or dictionary).

     type(object):  #Returns the type of an object.
     
     range([start], stop, [step]):  #Returns a sequence of numbers from start to stop with the specified step.
     ```