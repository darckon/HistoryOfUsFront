import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { Chart } from 'chart.js';

@Injectable({
  providedIn: 'root'
})

export class Graphs {

  colors: any[] = [];

  constructor() {
    this.set_colors();
  }

  time_chart(type_chart, instance, content) {
    let labels_x = content['labels'];
    let data = content['data'];
    let dataset = [];
    let label_value = "";
    let data_values = [];
    let data_repeat = [];

    for(let i = 0; i < data.length; i++) 
    {
      if (data_repeat.indexOf(data[i]['article']) == -1)
      {
        data_repeat.push(data[i]['article']);
        label_value = data[i]['article'];
        data_values = []
        data_values.push({x:data[i]['date'], y:data[i]['total']})
        for(let j = 0; j < data.length; j++) 
        {
          if(data[i]['article'] == data[j]['article'])
          {
            if(data[i]['date'] != data[j]['date'])
            {
              data_values.push({x:data[j]['date'], y:data[j]['total']})
            }
          }
        }
        dataset.push(
          {
            'label': label_value, 
            'data': data_values,
            'fill':false,
            'borderColor': this.colors['border_time_line'][i],
            'lineTension':0.1
          }
          );
      }
    }

    return new Chart(instance,
      {
        type: type_chart,
        data: {
          labels: labels_x,
          datasets: dataset,
        },
        options: {
        }
      });
  }


  pie_chart(type_chart, instance, content) {
    return new Chart(instance,
      {
        type: type_chart,
        data: {
          datasets: [{
            data: content['data'],
            backgroundColor: this.get_colors(content['colors'], 1),
            borderColor: this.get_colors(content['colors'], 2),
            borderWidth: 1,
            label: 'Dataset 1'
          }],
          labels: content['labels']
        },
        options: {
          responsive: true
        }
      });
  }

  bar_chart(type_chart, instance, content) {
    return new Chart(instance,
      {
        type: type_chart,
        data: {
          labels: content['labels'],
          datasets: [{
            label: '# Top 10',
            data: content['data'],
            backgroundColor: this.colors['background'],
            borderColor: this.colors['border'],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
  }

  set_colors() {
    this.colors['background'] =
      [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(201, 203, 207, 0.2)',
        'rgba(54, 50, 215, 0.2)',
        'rgba(204, 136, 111, 0.2)',
        'rgba(81, 60, 40, 0.2)',
        'rgba(0, 250, 250, 0.2)'
      ];

    this.colors['border'] =
      [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(201, 203, 207, 1)',
        'rgba(204, 136, 111, 1)',
        'rgba(81, 60, 40, 1)',
        'rgba(0, 250, 250, 1)'
      ];

    this.colors['border_time_line'] =
      [ 
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(201, 203, 207, 1)',
        'rgba(204, 136, 111, 1)',
        'rgba(81, 60, 40, 1)',
        'rgba(0, 250, 250, 1)'
      ]

    return this.colors;

  }

  //Type int | 1 = background, other = border
  get_colors(data, type)
  {
    let colors = [];
    for(let i = 0; i < data.length; i++) 
    {
      if(type==1)
      {
        colors.push(data[i]['background'])
      }else{
        colors.push(data[i]['border'])
      }
    }

    return colors
  }

}