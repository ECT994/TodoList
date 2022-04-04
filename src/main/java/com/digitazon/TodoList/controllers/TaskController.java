package com.digitazon.TodoList.controllers;
import com.digitazon.TodoList.entities.Category;
import com.digitazon.TodoList.entities.Task;
import com.digitazon.TodoList.repositories.CategoryRepository;
import com.digitazon.TodoList.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
   private TaskRepository taskRepository;

    @GetMapping("/")
    public Iterable<Task> home() {
       Iterable<Task> tasks = taskRepository.findAll(Sort.by(Sort.Direction.ASC, "created"));
        return tasks;
    }

    @GetMapping("/{id}")
    public Task read(@PathVariable int id) {
        return taskRepository.findById(id).orElseThrow();
    }

    @PostMapping("/add")
    public Task create(@RequestBody Task newTask) {
        Task savedTask = taskRepository.save(newTask);
        Category category = categoryRepository.findById(savedTask.getCategory().getId()).orElseThrow();
        savedTask.setCategory(category);
        return savedTask;
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable int id) {
        taskRepository.deleteById(id);
        return "ok";
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable int id, @RequestBody Task updateTask) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow();
        if (task.isDone()) {
            throw new Exception("Cannot update done task");
        }
        task.setName(updateTask.getName());
        return taskRepository.save(task);
    }

    @PutMapping("/{id}/set-done")
    public Task setDone(@PathVariable int id, @RequestBody Task updateTask) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setDone(updateTask.isDone());
        return taskRepository.save(task);
    }

    /*@PutMapping("/{id}")
    public Task update(@PathVariable int id, @RequestBody Task updateTask) throws Exception {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setDone(updateTask.isDone());
        task.setName(updateTask.getName());
        return taskRepository.save(task);
    }*/

}
