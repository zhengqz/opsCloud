package com.sdg.cmdb.service.impl;


import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.annotation.Resource;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = {"classpath:springtest/context.xml"})
public class WorkflowServiceIpmlTest {


    @Resource
    private WorkflowServiceImpl workflowServiceImpl;

    @Test
    public void test() {
        System.err.println(workflowServiceImpl.createTodo("KEYBOX"));
    }

    @Test
    public void testTodoPhase(){
        for(int i=2; i<=5; i++)
            System.err.println(i);
    }

}
