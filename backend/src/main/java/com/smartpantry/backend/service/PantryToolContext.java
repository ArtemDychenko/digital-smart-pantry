package com.smartpantry.backend.service;

import java.util.ArrayList;
import java.util.List;

public class PantryToolContext {

    private static final ThreadLocal<List<ProductAction>> actions =
            ThreadLocal.withInitial(ArrayList::new);

    public static void recordAction(String actionType, String name, int quantity) {
        actions.get().add(new ProductAction(actionType, name, quantity));
    }

    public static List<ProductAction> getAndClear() {
        List<ProductAction> result = new ArrayList<>(actions.get());
        actions.get().clear();
        actions.remove();
        return result;
    }

    public record ProductAction(String actionType, String name, int quantity) {}
}
